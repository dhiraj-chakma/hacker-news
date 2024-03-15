import * as React from "react";
import axios from "axios";

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

const [
  stories_fetch_init,
  stories_fetch_success,
  stories_fetch_failure,
  remove_story,
] = [
  "STORIES_FETCH_INIT",
  "STORIES_FETCHT_SUCCESS",
  "STORIES_FETCH_FAILURE",
  "REMOVE_STORY",
];

// Reducer function for managing stories state
const storiesReducer = (state, action) => {
  switch (action.type) {
    case stories_fetch_init:
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case stories_fetch_success:
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case stories_fetch_failure:
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case remove_story:
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

// Main App component
const App = () => {
  // Using useReducer for stories state management
  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  });

  // State hook for search term, persisted in localStorage
  const [searchTerm, setSearchTerm] = useStorageState("search", "React");

  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);
  // Effect hook for fetching stories on component mount

  const handleFetchstories = React.useCallback(async () => {
    dispatchStories({ type: stories_fetch_init });

    try {
      const result = await axios.get(url);

      dispatchStories({
        type: stories_fetch_success,
        payload: result.data.hits,
      });
    } catch {
      dispatchStories({ type: stories_fetch_failure });
    }
  }, [url]);

  React.useEffect(() => {
    handleFetchstories();
  }, [handleFetchstories]);

  // Handler for search input changes
  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);

    event.preventDefault();
  };

  const handleSearchSubmit = () => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
  };

  // Handler for removing a story
  const handleRemoveStory = (item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  };

  // Render the main App component
  return (
    <div className="container mx-auto sm:px-6 lg:px-8">
      <h1 className="font-bold ">My Hacker Stories</h1>
      <SearchForm
        onSearchSubmit={handleSearchSubmit}
        onSearchInput={handleSearchInput}
        searchTerm={searchTerm}
      />

      <hr />

      {stories.isError && <p>something went wrong....</p>}

      {stories.isLoading ? (
        <p> Loading.....</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
};

const SearchForm = ({ onSearchSubmit, onSearchInput, searchTerm }) => (
  <form onSubmit={onSearchSubmit}>
    <InputWithLabel
      id="search"
      label="Search"
      onInputChange={onSearchInput}
      isFocused
      value={searchTerm}
    >
      <strong>Search:</strong>
    </InputWithLabel>
    <button disabled={!searchTerm} className="btn btn-outline btn-secondary">
      Submit
    </button>
  </form>
);

// Search component for input field
const InputWithLabel = ({
  id,
  children,
  isFocused,
  onInputChange,
  type = "text",
  value,
  handleClick,
}) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id}>{children} </label>&nbsp;
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        autoFocus={isFocused}
        onChange={onInputChange}
        placeholder="Type here"
        className="input w-full max-w-xs custom-input-size text-sm"
      />
    </>
  );
};

// List component to display stories
const List = ({ list, onRemoveItem }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">{/* Header content here */}</div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="text-left container mx-auto sm:px-6 lg:px-8"
                    scope="col"
                  >
                    Article
                  </th>
                  <th className="text-left" scope="col">
                    Author
                  </th>
                  <th className="text-left" scope="col">
                    Comments
                  </th>
                  <th className="text-left" scope="col">
                    Points
                  </th>
                  <th scope="col">
                    <span className="sr-only">Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, index) => (
                  <Item
                    key={item.index}
                    item={item}
                    onRemoveItem={onRemoveItem}
                    isOdd={index % 2 !== 0}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
const Item = ({ item, onRemoveItem, isOdd }) => {
  return (
    <tr
      className={`${
        isOdd ? "bg-gray-100" : "bg-white"
      } border-b border-gray-200 whitespace-nowrap`}
    >
      <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
        <a className="link link-secondary" href={item.url}>
          {item.title}
        </a>
      </td>
      <td
        className={`whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 sm:table-cell ${
          isOdd ? "border-b border-gray-200" : ""
        }`}
      >
        {item.author}
      </td>
      <td
        className={`whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell ${
          isOdd ? "border-b border-gray-200" : ""
        }`}
      >
        {item.num_comments}
      </td>
      <td
        className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 ${
          isOdd ? "border-b border-gray-200" : ""
        }`}
      >
        {item.points}
      </td>
      <td
        className={`relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-6 lg:pr-8 ${
          isOdd ? "border-b border-gray-200" : ""
        }`}
      >
        <button
          onClick={() => onRemoveItem(item)}
          className="btn btn-circle custom-btn-circle"
          type="button"
        >
          {/* SVG for delete icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
};

export default App;
