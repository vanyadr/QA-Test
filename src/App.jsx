import { createContext, useContext, useEffect, useState } from "react";
import "./index.css";

const TasksContext = createContext();

function App() {
   const [openSection, setOpenSection] = useState({
      taskForm: false,
      taskList: true,
      completedTaskList: true,
   });
   const [tasks, setTasks] = useState([]);
   const [sortType, setSortType] = useState("date");
   const [sortOrder, setSortOrder] = useState("asc");
   const [currentTime, setCurrentTime] = useState(new Date());

   useEffect(() => {
      const timer = setInterval(() => {
         setCurrentTime(new Date());
      }, 1000);

      return clearInterval(timer);
   }, []);

   const toggleSection = (section) => {
      setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
   };
   const addTask = (task) => {
      setTasks((prev) => [
         ...prev,
         {
            ...task,
            completed: false,
            id: Date.now(),
         },
      ]);
   };
   const deleteTask = (id) => {
      setTasks(tasks.filter((task) => task.id !== id));
   };
   const completeTask = (id) => {
      setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: true } : task)));
   };
   const toggleSort = (type) => {
      if (sortType === type) {
         setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
         setSortType(type);
         setSortOrder("asc");
      }
   };
   const sortTasks = (tasks) => {
      return tasks.slice().sort((a, b) => {
         if (sortType === "priority") {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            return sortOrder === "asc"
               ? priorityOrder[a.priority.toLowerCase()] - priorityOrder[b.priority.toLowerCase()]
               : priorityOrder[b.priority.toLowerCase()] - priorityOrder[a.priority.toLowerCase()];
         } else {
            return sortOrder === "asc"
               ? new Date(a.deadline) - new Date(b.deadline)
               : new Date(b.deadline) - new Date(a.deadline);
         }
      });
   };

   const activeTasks = sortTasks(tasks.filter((task) => !task.completed));
   const completedTasks = tasks.filter((task) => task.completed);

   return (
      <>
         <TasksContext.Provider value={{ addTask, completeTask, activeTasks, deleteTask, currentTime, completedTasks }}>
            <div className="app">
               <div className="task-container">
                  <h1>Task List with Priority</h1>
                  <button
                     onClick={() => toggleSection("taskForm")}
                     className={`close-button ${openSection.taskForm ? "open" : ""}`}
                  >
                     +
                  </button>
                  {openSection.taskForm && <TaskForm />}
               </div>
               <div className="task-container">
                  <h2>Tasks</h2>
                  <button
                     onClick={() => toggleSection("taskList")}
                     className={`close-button ${openSection.taskList ? "open" : ""}`}
                  >
                     +
                  </button>
                  <div className="sort-controls">
                     <button
                        className={`sort-button ${sortType === "date" ? "active" : ""}`}
                        onClick={() => toggleSort("date")}
                     >
                        By date {sortType === "date" && (sortOrder === "asc" ? "\u2191" : "\u2193")}
                     </button>
                     <button
                        className={`sort-button ${sortType === "priority" ? "active" : ""}`}
                        onClick={() => toggleSort("priority")}
                     >
                        By Priority {sortType === "priority" && (sortOrder === "asc" ? "\u2191" : "\u2193")}
                     </button>
                  </div>
                  {openSection.taskList && <TaskList />}
               </div>
               <div className="completed-task-container">
                  <h2>Completed Tasks</h2>
                  <button
                     onClick={() => toggleSection("completedTaskList")}
                     className={`close-button ${openSection.completedTaskList ? "open" : ""}`}
                  >
                     +
                  </button>
                  {openSection.completedTaskList && <CompletedTaskList />}
               </div>
               <Footer />
            </div>
         </TasksContext.Provider>
      </>
   );
}

const TaskForm = () => {
   const { addTask } = useContext(TasksContext);
   const [formData, setFormData] = useState({
      title: "",
      priority: "Low",
      deadline: "",
   });

   const handleSubmit = (e) => {
      e.preventDefault();

      if (formData.title.trim() && formData.deadline) {
         addTask(formData);
         setFormData({
            title: "",
            priority: "Low",
            deadline: "",
         });
      }
   };

   return (
      <>
         <form action="" onSubmit={handleSubmit} className="task-form">
            <input
               type="text"
               value={formData.title}
               onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
               placeholder="Task title"
               required
            />
            <select
               value={formData.priority}
               onChange={(e) =>
                  setFormData((prev) => ({
                     ...prev,
                     priority: e.target.value,
                  }))
               }
               required
            >
               <option value="High">High</option>
               <option value="Medium">Medium</option>
               <option value="Low">Low</option>
            </select>
            <input
               type="datetime-local"
               value={formData.deadline}
               onChange={(e) =>
                  setFormData((prev) => ({
                     ...prev,
                     deadline: e.target.value,
                  }))
               }
               required
            />
            <button type="submit">Add task</button>
         </form>
      </>
   );
};

const TaskList = () => {
   const { activeTasks, currentTime } = useContext(TasksContext);

   return (
      <ul className="task-list">
         {activeTasks.map((task) => (
            <TaskItem task={task} key={task.id} isOverdue={new Date(task.deadline) < currentTime} />
         ))}
      </ul>
   );
};

const CompletedTaskList = () => {
   const { completedTasks } = useContext(TasksContext);

   return (
      <ul className="task-list">
         {completedTasks.map((task) => (
            <TaskItem task={task} key={task.id} />
         ))}
      </ul>
   );
};

const TaskItem = ({ task, isOverdue }) => {
   const { deleteTask, completeTask } = useContext(TasksContext);

   return (
      <li className={`task-item ${task.priority.toLowerCase()} ${isOverdue ? "overdue" : ""}`}>
         <div className="task-info">
            <div>
               {task.title} <strong>{task.priority}</strong>
            </div>
            <div className="task-deadline">Due: {new Date(task.deadline).toLocaleString()}</div>
         </div>
         <div className="task-buttons">
            {!task.completed && (
               <button className="complete-button" onClick={() => completeTask(task.id)}>
                  Complete
               </button>
            )}
            <button className="delete-button" onClick={() => deleteTask(task.id)}>
               Delete
            </button>
         </div>
      </li>
   );
};

const Footer = () => {
   return (
      <footer className="footer">
         <p>Made by i.drugov</p>
      </footer>
   );
};

export default App;
