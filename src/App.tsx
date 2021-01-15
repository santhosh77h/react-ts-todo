import React, { useState } from 'react';
import './App.css';
import DeleteIcon from './assets/delete.png';
interface IToDos {
	id: string;
	task?: string;
	complete: boolean;
}

interface ReactAction {
	id: string;
	type: 'DO_TODO' | 'UNDO_TODO' | 'CREATE_TODO' | 'DELETE_TODO';
	task?: string;
}

function getInitialState(stateField: string): IToDos[] {
	const value = localStorage.getItem(stateField);
	if (typeof value === 'string') {
		return JSON.parse(value);
	}
	return [];
}

const initialTodos: IToDos[] = getInitialState('my-state');

const todoReducer = (state: IToDos[] = initialTodos, action: ReactAction): IToDos[] => {
	switch (action.type) {
		case 'DO_TODO':
			return state.map((todo) => {
				if (todo.id === action.id) {
					return { ...todo, complete: true };
				} else {
					return todo;
				}
			});
		case 'UNDO_TODO':
			return state.map((todo) => {
				if (todo.id === action.id) {
					return { ...todo, complete: false };
				} else {
					return todo;
				}
			});
		case 'CREATE_TODO':
			return [
				...state,
				{
					id: action.id,
					complete: false,
					task: action.task,
				},
			];
		case 'DELETE_TODO':
			return state.filter((el) => {
				return el.id !== action.id;
			});
		default:
			return state;
	}
};

interface ICreateToDo {
	createNewTodo: (task: string) => void;
}

function CreateTodo({ createNewTodo }: ICreateToDo) {
	const [todo, setTodo] = useState('');
	const createTodoTo = function (e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		createNewTodo(todo);
		setTodo('');
	};
	return (
		<form className={'new-todo-container'} onSubmit={createTodoTo}>
			<input
				type={'text'}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					setTodo(e.target.value);
				}}
				value={todo}
				placeholder={'New Task'}
			/>
			<button>Create Task</button>
		</form>
	);
}
const withLocalStorageCache = (reducer: (state: IToDos[] | undefined, action: ReactAction) => IToDos[]) => {
	return (state: IToDos[], action: ReactAction) => {
		const newState = reducer(state, action);
		localStorage.setItem('my-state', JSON.stringify(newState));
		return newState;
	};
};

function App() {
	const [todos, dispatch] = React.useReducer(withLocalStorageCache(todoReducer), initialTodos);

	console.log(todos);
	const createNewTodo = function (task: string): void {
		dispatch({ type: 'CREATE_TODO', task, id: Date.now() + '' });
	};

	const deleteTodo = (id: string) => (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		console.log('sass');
		dispatch({ type: 'DELETE_TODO', id });
	};

	return (
		<div className="App">
			<header className="App-header">
				<h1>MY TODOS</h1>
				{todos.map((el: IToDos, index) => {
					return (
						<div
							onClick={() => {
								dispatch({ type: !el.complete ? 'DO_TODO' : 'UNDO_TODO', id: el.id });
							}}
							className={el.complete ? 'each-todo completed' : 'each-todo'}
							key={el.id}
						>
							{el.task}
							<span className={'completed-text'}>
								{el.complete ? (
									'completed'
								) : (
									<img
										onClick={deleteTodo(el.id)}
										src={DeleteIcon}
										className={'delete-icon'}
										alt={'delete'}
									/>
								)}
							</span>
						</div>
					);
				})}
				<CreateTodo createNewTodo={createNewTodo} />
			</header>
		</div>
	);
}

export default App;
