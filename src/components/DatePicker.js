import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DatePicker({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(value ? new Date(value.split('/').reverse().join('-')) : new Date());

  const formatDate = (dateObj) => {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (selectedDate) {
      setDate(selectedDate);
      onChange(formatDate(selectedDate));
    }
  };

  const handleConfirm = () => {
    setShow(false);
  };

  const handleCancel = () => {
    setShow(false);
  };

  // For web, use HTML5 date input
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <input
          type="date"
          value={value ? value.split('/').reverse().join('-') : ''}
          onChange={(e) => {
            if (e.target.value) {
              const selectedDate = new Date(e.target.value);
              onChange(formatDate(selectedDate));
            }
          }}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            borderWidth: 2,
            borderColor: '#e91e63',
            borderRadius: 8,
            backgroundColor: '#fff',
          }}
        />
      </View>
    );
  }

  // For iOS and Android
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShow(true)}>
        <Text style={styles.dateText}>
          {value || 'Select Date'}
        </Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={show}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={[styles.modalButton, styles.confirmButton]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#2196F3',
    marginBottom: 8,
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e91e63',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  calendarIcon: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalButton: {
    fontSize: 16,
    color: '#2196F3',
    paddingHorizontal: 10,
  },
  confirmButton: {
    fontWeight: 'bold',
  },
  datePicker: {
    width: '100%',
    height: 200,
  },
});

