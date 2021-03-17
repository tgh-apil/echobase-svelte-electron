<script>
    export let options;
    export let id;
    export let label;
    export let group;
</script>

<h3 for={id}>{label}</h3>
{#each options as option}
    <label class="container">
        <input type=radio bind:group={group} value={option.value}>
        {option.label}
        <span class="checkmark"></span>
    </label>
{/each}

<style>
/* straight from w3 schools */

/* Customize the label (the container) */
.container {
    display: block;
    position: relative;
    padding-left: 2rem;
    margin-bottom: 1rem;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    font-size: 16px;
}

/* Hide the browser's default radio button */
.container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

/* Create a custom radio button */
.checkmark {
    position: absolute;
    top: 2px;
    left: 0px;
    height: 1rem;
    width: 1rem;
    background-color: #fff;
    border-radius: 50%;
}

/* On mouse-over, add a background color */
.container:hover input ~ .checkmark {
    background-color: #d3455f;
}

/* When the radio button is checked, add a background */
.container input:checked ~ .checkmark {
    background-color: #d3455f;
}

/* Create the indicator (the dot/circle - hidden when not checked) */
.checkmark:after {
    content: "";
    position: absolute;
    display: none;
}

/* Show the indicator (dot/circle) when checked */
.container input:checked ~ .checkmark:after {
    display: block;
}

/* Style the indicator (dot/circle) */
.container .checkmark:after {
    top: 0.25rem;
    left: 0.25rem;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #fff;
}
</style>