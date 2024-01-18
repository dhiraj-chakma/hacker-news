import * as React from "react";

// Custom hook for managing state in localStorage
const useStorageState = (key, initialState) => {
  // State hook that initializes from localStorage or provided initial state
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  // Effect hook to update localStorage whenever the state changes
  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  // Return the state value and setter function
  return [value, setValue];
};

const initalStories = [
  {
    title: "React",
    url: "https://reactjs.org/",
    author: "Jordan Walke",
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: "Redux",
    url: "https://redux.js.org/",
    author: "Dan Abramov, Andrew Clark",
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];
const getAsyncStories = () =>
  new Promise((resolve) =>
    setTimeout(() => resolve({ data: { stories: initalStories } }), 2000)
  );

const storiesReducer = (state, action) => {
  switch (action.type) {
    case "SET_STORIES":
      return action.payload;
    case "REMOVE_STORY":
      return state.filter(
        (story) => action.payload.objectID !== story.objectID
      );
    default:
      throw new Error();
  }
};

// Main App component
const App = () => {
  // Sample data for stories
  const [stories, dispatchStories] = React.useReducer(storiesReducer, []);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true);

    getAsyncStories()
      .then((result) => {
        setIsLoading(false);
        dispatchStories({
          type: "SET_STORIES",
          payload: result.data.stories,
        });
      })
      .catch(() => setIsError(true));
  }, []);

  // State hook for search term, persisted in localStorage
  const [searchTerm, setSearchTerm] = useStorageState("search", "React");

  // Handler for search input changes
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter stories based on search term
  const searchedStories = stories.filter((story) =>
    story.title.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
  );

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  };

  // Render the main App component
  return (
    <>
      <h1>My Hacker Stories</h1>

      <InputWithLabel
        id="search"
        label="Search"
        onInputChange={handleSearch}
        isFocused
        value={searchTerm}
      >
        <strong>Search:</strong>
      </InputWithLabel>
      <hr />

      {isError && <p>something went wrong....m</p>}

      {isLoading ? (
        <p> Loading.....</p>
      ) : (
        <List list={searchedStories} onRemoveItem={handleRemoveStory} />
      )}
    </>
  );
};

// Search component for input field
const InputWithLabel = ({
  id,
  children,
  isFocused,
  onInputChange,
  type = "text",
  value,
}) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);
  return (
    <>
      <label htmlFor="id">{children} </label>&nbsp;
      <input
        ref={inputRef}
        id="id"
        type={type}
        value={value}
        autoFocus={isFocused}
        onChange={onInputChange}
      />
    </>
  );
};

// List component to display stories
const List = ({ list, onRemoveItem }) => (
  <ul>
    {list.map((item) => (
      <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
    ))}
  </ul>
);
// Item component for displaying each story
const Item = ({ item, onRemoveItem }) => {
  return (
    <li>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>

      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <button type="button" onClick={() => onRemoveItem(item)}>
        Dismiss
      </button>
    </li>
  );
};

export default App;
