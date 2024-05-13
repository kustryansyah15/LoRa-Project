import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel, QLineEdit, QPushButton, QMessageBox, QVBoxLayout, QWidget, QFormLayout, QFileDialog, QTextEdit, QDialog, QDialogButtonBox
from PyQt5 import QtGui
import mysql.connector

# Function to read the database configuration from db.conf file
def read_db_config():
    db_config = {}
    try:
        with open('db.conf', 'r') as file:
            for line in file:
                key, value = line.strip().split('=')
                db_config[key] = value
    except FileNotFoundError:
        db_config['host'] = 'localhost'
        db_config['user'] = 'username'
        db_config['password'] = 'password'
        db_config['database'] = 'database_name'
        write_db_config(db_config)
        show_error_message("Error", "db.conf file not found. A new db.conf file with default values has been created. Edit the file by clicking the [Edit Configuration] button.")
    return db_config

# Function to write the database configuration to db.conf file
def write_db_config(db_config):
    with open('db.conf', 'w') as file:
        for key, value in db_config.items():
            file.write(f"{key}={value}\n")

# Function to update data in the database
def update_data(node_id, longitude, latitude, is_need_shade, db_config):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # SQL query to update the data
        sql = "UPDATE nodes SET Longitude = %s, Latitude = %s, Is_Need_Shade = %s WHERE Node_Id = %s"
        data = (longitude, latitude, is_need_shade, node_id)

        cursor.execute(sql, data)
        conn.commit()

        return True
    except mysql.connector.Error as error:
        show_error_message("Error", f"Error updating data: {error}")
        return False
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

# Function to display an error message
def show_error_message(title, message):
    error_dialog = QMessageBox()
    error_dialog.setIcon(QMessageBox.Warning)
    error_dialog.setWindowTitle(title)
    error_dialog.setText(message)
    error_dialog.exec_()

# Create a custom QMainWindow subclass for the GUI window
class NodeDataUpdaterWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Node Data Updater")
        self.setGeometry(100, 100, 400, 300)

        # Create a central widget and a vertical layout for it
        central_widget = QWidget(self)
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)

        # Create a form layout for labels and input fields
        form_layout = QFormLayout()
        layout.addLayout(form_layout)

        # Create labels and input fields
        self.entry_node_id = QLineEdit()
        self.entry_longitude = QLineEdit()
        self.entry_latitude = QLineEdit()
        self.entry_is_need_shade = QLineEdit()

        # Add labels and input fields to the form layout
        form_layout.addRow(QLabel("Node ID (1 to 4):"), self.entry_node_id)
        form_layout.addRow(QLabel("Longitude (-90 to 90):"), self.entry_longitude)
        form_layout.addRow(QLabel("Latitude (-180 to 180):"), self.entry_latitude)
        form_layout.addRow(QLabel("Is Need Shade (0 or 1):"), self.entry_is_need_shade)

        # Create the update button
        self.button_update = QPushButton("Update")
        layout.addWidget(self.button_update)
        self.button_update.clicked.connect(self.handle_update)

        # Create the edit config button
        self.button_edit_config = QPushButton("Edit Configuration")
        layout.addWidget(self.button_edit_config)
        self.button_edit_config.clicked.connect(self.edit_config)

        # Read the database configuration from db.conf file
        self.db_config = read_db_config()

    # Function to handle the update button click
    def handle_update(self):
        # Get the input values
        node_id = self.entry_node_id.text()
        longitude = self.entry_longitude.text()
        latitude = self.entry_latitude.text()
        is_need_shade = self.entry_is_need_shade.text()

        try:
            # Validate the input values
            node_id = int(node_id)
            longitude = float(longitude)
            latitude = float(latitude)
            is_need_shade = int(is_need_shade)

            if not (1 <= node_id <= 4):
                show_error_message("Error", "Node ID must be between 1 and 4.")
            elif not (-90 <= longitude <= 90):
                show_error_message("Error", "Longitude must be between -90 and 90.")
            elif not (-180 <= latitude <= 180):
                show_error_message("Error", "Latitude must be between -180 and 180.")
            elif is_need_shade not in [0, 1]:
                show_error_message("Error", "Is Need Shade must be either 0 or 1.")
            else:
                if update_data(node_id, longitude, latitude, is_need_shade, self.db_config):
                    QMessageBox.information(self, "Success", "Data updated successfully.")
                else:
                    QMessageBox.warning(self, "Error", "Failed to update data.")
        except ValueError:
            show_error_message("Error", "Invalid input type. Please enter numeric values.")

    # Function to handle the edit config button click
    def edit_config(self):
        options = QFileDialog.Options()
        options |= QFileDialog.DontUseNativeDialog
        file_dialog = QFileDialog()
        file_dialog.setOptions(options)
        file_dialog.setFileMode(QFileDialog.ExistingFile)
        file_dialog.setNameFilter("Config files (*.conf)")
        file_dialog.setWindowTitle("Edit Configuration")
        if file_dialog.exec_() == QFileDialog.Accepted:
            selected_file = file_dialog.selectedFiles()[0]
            self.open_text_editor(selected_file)

    # Function to open a text editor for the selected file
    def open_text_editor(self, file_path):
        dialog = QDialog(self)
        dialog.setWindowTitle("Edit Configuration")

        # Create a text edit widget
        text_edit = QTextEdit()
        with open(file_path, 'r') as file:
            text_edit.setPlainText(file.read())

        # Create a dialog button box
        button_box = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        button_box.accepted.connect(dialog.accept)
        button_box.rejected.connect(dialog.reject)

        # Create a vertical layout for the dialog
        layout = QVBoxLayout(dialog)
        layout.addWidget(text_edit)
        layout.addWidget(button_box)

        # Open the dialog
        if dialog.exec_() == QDialog.Accepted:
            updated_config = text_edit.toPlainText()
            try:
                with open(file_path, 'w') as file:
                    file.write(updated_config)
                self.db_config = read_db_config()
                QMessageBox.information(self, "Success", "Configuration updated successfully.")
            except Exception as e:
                show_error_message("Error", f"Failed to update the configuration: {str(e)}")

# Create the application instance
app = QApplication(sys.argv)

# Set the application style
app.setStyle("Fusion")

# Set the application font
font = app.font()
font.setPointSize(10)
app.setFont(font)

# Set the application palette
palette = app.palette()
palette.setColor(palette.Window, QtGui.QColor(240, 240, 240))
palette.setColor(palette.WindowText, QtGui.QColor(40, 40, 40))
app.setPalette(palette)

# Create the main window instance
window = NodeDataUpdaterWindow()
window.show()

# Start the event loop
sys.exit(app.exec_())