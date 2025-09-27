import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@tasks_v1';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('ALL'); 

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks) setTasks(JSON.parse(storedTasks));
    } catch (e) {
      console.warn('Failed to load tasks', e);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save tasks', e);
    }
  };

  const addTask = () => {
    const title = text.trim();
    if (!title) return Alert.alert('Please enter a task');

    const newTask = {
      id: Date.now().toString(),
      title,
      completed: false,
    };

    setTasks(prev => [newTask, ...prev]);
    setText('');
  };

  const toggleComplete = id => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = id => {
    Alert.alert('Delete task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setTasks(prev => prev.filter(t => t.id !== id)) },
    ]);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return !t.completed;
    if (filter === 'COMPLETED') return t.completed;
  });

  const renderItem = ({ item }) => (
    <View style={styles.taskRow}>
      <Text style={[styles.taskTitle, item.completed && styles.completedText]}>{item.title}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => toggleComplete(item.id)}>
          <Text style={styles.actionText}>{item.completed ? 'Undo' : 'Done'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => deleteTask(item.id)}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Task Manager</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a task"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTask}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterBtn, filter === 'ALL' && styles.filterActive]} onPress={() => setFilter('ALL')}>
          <Text>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, filter === 'PENDING' && styles.filterActive]} onPress={() => setFilter('PENDING')}>
          <Text>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, filter === 'COMPLETED' && styles.filterActive]} onPress={() => setFilter('COMPLETED')}>
          <Text>Completed</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={() => <Text style={styles.empty}>No tasks yet</Text>}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f0f0' },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  inputRow: { flexDirection: 'row', marginBottom: 16 },
  input: { flex: 1, padding: 10, backgroundColor: 'white', borderRadius: 6, borderWidth: 1, borderColor: '#ccc' },
  addBtn: { backgroundColor: '#2d87f0', padding: 12, borderRadius: 6, marginLeft: 8 },
  addBtnText: { color: 'white', fontWeight: '600' },
  filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  filterBtn: { padding: 8, borderRadius: 6, backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc' },
  filterActive: { backgroundColor: '#d6e9ff' },
  taskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: 'white', borderRadius: 6, marginBottom: 8 },
  taskTitle: { fontSize: 16 },
  completedText: { textDecorationLine: 'line-through', color: '#999' },
  buttons: { flexDirection: 'row' },
  actionBtn: { padding: 8, backgroundColor: '#d1f7d6', borderRadius: 6, marginLeft: 8 },
  deleteBtn: { backgroundColor: '#ff6b6b' },
  actionText: { fontWeight: '600' },
  empty: { textAlign: 'center', color: '#666', marginTop: 50 }
});
