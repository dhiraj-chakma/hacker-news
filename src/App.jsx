import * as React from "react";

// Custom hook for managing state in localStorage.
// It initializes the state from localStorage or uses a provided initial state.
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



const [stories_fetch_init, stories_fetch_success, stories_fetch_failure,remove_story] = ["STORIES_FETCH_INIT", "STORIES_FETCHT_SUCCESS","STORIES_FETCH_FAILURE","REMOVE_STORY"];

// Reducer function for managing stories state
const storiesReducer = (state, action) => {
  switch (action.type) {
    case stories_fetch_init:
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case stories_fetch_success:
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      }
      case stories_fetch_failure:
        return {
          ...state,
          isLoading: false,
          isError: true
        }
        case remove_story:
          return {
            ...state,
            data:state.data.filter(
            (story) => action.payload.objectID !== story.objectID
          )}
    default:
      throw new Error();
  }
};

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query="

// Main App component
const App = () => {
  // Using useReducer for stories state management
  const [stories, dispatchStories] = React.useReducer(storiesReducer, {data: [], isLoading: false, isError:false});

  // Effect hook for fetching stories on component mount
  React.useEffect(() => {
    dispatchStories({type: stories_fetch_init})

    fetch(`${API_ENDPOINT}react`)
    .then(response=>response.json()).then(result=>{
        dispatchStories({
          type: stories_fetch_success,
          payload: result.hits,
        })
      })
      .catch(() =>
      dispatchStories({type: "STORIES_FETCH_FAILURE"}));
  }, []);

  // State hook for search term, persisted in localStorage
  const [searchTerm, setSearchTerm] = useStorageState("search", "React");

  // Handler for search input changes
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Function to filter stories based on the search term
  const searchedStories = stories.data.filter((story) =>
    story.title.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
  );

  // Handler for removing a story
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

      {stories.isError && <p>something went wrong....</p> }

      {stories.isLoading ? (
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
        id={id}
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
