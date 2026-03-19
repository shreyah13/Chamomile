// Activity recommendations by mood
const activities = {
    happy: [
        "Go for a walk in nature",
        "Call a friend to share your happiness",
        "Start a creative project",
        "Dance to your favorite music"
    ],
    calm: [
        "Practice meditation for 10 minutes",
        "Read a book with a cup of tea",
        "Do some gentle stretching",
        "Write in your journal"
    ],
    sad: [
        "Watch a feel-good movie",
        "Write down three things you're grateful for",
        "Take a warm bath or shower",
        "Listen to uplifting music"
    ],
    energetic: [
        "Go for a run or quick workout",
        "Clean or organize part of your home",
        "Start a challenging project",
        "Play an active game"
    ]
};

// DOM Elements
const loginPage = document.getElementById("login-page");
const moodPage = document.getElementById("mood-page");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("login-error");
const userNameSpan = document.getElementById("user-name");
const moodButtons = document.querySelectorAll(".mood-btn");
const activityList = document.getElementById("activity-list");
const proceedToFeedbackBtn = document.getElementById("proceed-to-feedback-btn");
const feedbackPage = document.getElementById("feedback-page");
const backToMoodBtn = document.getElementById("back-to-mood-btn");
const submitFeedbackBtn = document.getElementById("submit-feedback-btn");
const continueQuitPage = document.getElementById("continue-quit-page");
const continueBtn = document.getElementById("continue-btn");
const finalQuitBtn = document.getElementById("final-quit-btn");

// Login functionality
loginBtn.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store user info in session storage
            sessionStorage.setItem('user_id', data.user_id);
            sessionStorage.setItem('user_name', data.name);
            
            // Update UI
            userNameSpan.textContent = data.name;
            loginPage.style.display = "none";
            moodPage.style.display = "block";
            loginError.style.display = "none";
        } else {
            loginError.style.display = "block";
        }
    } catch (error) {
        console.error('Error:', error);
        loginError.style.display = "block";
    }
});

// Mood selection functionality
moodButtons.forEach(button => {
    button.addEventListener("click", () => {
        // Remove active class from all buttons
        moodButtons.forEach(btn => btn.classList.remove("active"));
        
        // Add active class to clicked button
        button.classList.add("active");
        
        // Get selected mood
        const mood = button.getAttribute("data-mood");
        
        // Display activities for the selected mood
        displayActivities(mood);
        
        // Store selected mood in session storage
        sessionStorage.setItem('selected_mood', mood);
    });
});

// Function to display activities based on mood
function displayActivities(mood) {
    const moodActivities = activities[mood];
    
    // Clear existing activities
    activityList.innerHTML = "";
    
    // Add activities for the selected mood
    moodActivities.forEach(activity => {
        const li = document.createElement("li");
        li.textContent = activity;
        activityList.appendChild(li);
    });
}

// Proceed to feedback functionality
proceedToFeedbackBtn.addEventListener("click", () => {
    moodPage.style.display = "none";
    feedbackPage.style.display = "block";
});

// Back to mood without submitting
backToMoodBtn.addEventListener("click", () => {
    feedbackPage.style.display = "none";
    moodPage.style.display = "block";
});

// Submit feedback functionality
submitFeedbackBtn.addEventListener("click", async () => {
    const user_id = sessionStorage.getItem('user_id');
    const activeMood = document.querySelector(".mood-btn.active");
    const mood = activeMood ? activeMood.getAttribute("data-mood") : "not_specified";
    const feeling_after = document.getElementById("feeling-after").value;
    const worthwhile = document.getElementById("worthwhile").value;
    const general_feedback = document.getElementById("general-feedback").value;
    
    try {
        const response = await fetch('/api/save_feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id,
                mood,
                feeling_after,
                worthwhile,
                general_feedback
            }),
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Clear feedback form
            document.getElementById("feeling-after").value = "";
            document.getElementById("worthwhile").value = "";
            document.getElementById("general-feedback").value = "";
            
            // Show continue or quit page
            feedbackPage.style.display = "none";
            continueQuitPage.style.display = "block";
        } else {
            alert("Error saving feedback. Please try again.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Error saving feedback. Please try again.");
    }
});

// Continue functionality
continueBtn.addEventListener("click", () => {
    // Return to mood page
    continueQuitPage.style.display = "none";
    moodPage.style.display = "block";
    
    // Reset mood selection
    moodButtons.forEach(btn => btn.classList.remove("active"));
    
    // Reset activity list
    activityList.innerHTML = "<li>Select a mood to see recommended activities</li>";
    
    // Clear session storage mood
    sessionStorage.removeItem('selected_mood');
});

// Final quit functionality
finalQuitBtn.addEventListener("click", () => {
    alert("Thank you for using our app. Goodbye!");
    loginPage.style.display = "block";
    continueQuitPage.style.display = "none";
    
    // Reset mood selection
    moodButtons.forEach(btn => btn.classList.remove("active"));
    
    // Reset activity list
    activityList.innerHTML = "<li>Select a mood to see recommended activities</li>";
    
    // Clear session storage
    sessionStorage.clear();
});

// Logout functionality
logoutBtn.addEventListener("click", () => {
    loginPage.style.display = "block";
    moodPage.style.display = "none";
    feedbackPage.style.display = "none";
    continueQuitPage.style.display = "none";
    
    // Reset mood selection
    moodButtons.forEach(btn => btn.classList.remove("active"));
    
    // Reset activity list
    activityList.innerHTML = "<li>Select a mood to see recommended activities</li>";
    
    // Clear session storage
    sessionStorage.clear();
});

// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    const user_id = sessionStorage.getItem('user_id');
    const user_name = sessionStorage.getItem('user_name');
    
    if (user_id && user_name) {
        userNameSpan.textContent = user_name;
        loginPage.style.display = "none";
        moodPage.style.display = "block";
        
        // If mood was previously selected, restore it
        const selected_mood = sessionStorage.getItem('selected_mood');
        if (selected_mood) {
            const moodBtn = document.querySelector(`.mood-btn[data-mood="${selected_mood}"]`);
            if (moodBtn) {
                moodBtn.classList.add('active');
                displayActivities(selected_mood);
            }
        }
    }
});