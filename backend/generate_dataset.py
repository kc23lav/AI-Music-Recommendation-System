import pandas as pd
import random

genres = ['Pop', 'Rock', 'Electronic', 'Classical', 'Hip Hop', 'Funk']
moods = ['Happy', 'Sad', 'Energetic', 'Chill', 'Dramatic']

songs = [
    # Initial 30 + 70 more
    # format: Title, Artist, Genre, Mood, Tempo, Energy, Danceability, Acousticness, Valence, Speechiness
    ("Blinding Lights", "The Weeknd", "Pop", "Energetic", 171, 0.73, 0.51, 0.00, 0.33, 0.05),
    ("Shape of You", "Ed Sheeran", "Pop", "Happy", 96, 0.65, 0.82, 0.58, 0.93, 0.08),
    ("Bohemian Rhapsody", "Queen", "Rock", "Dramatic", 72, 0.40, 0.41, 0.27, 0.22, 0.05),
    ("Someone Like You", "Adele", "Pop", "Sad", 135, 0.33, 0.55, 0.89, 0.28, 0.03),
    ("Uptown Funk", "Mark Ronson", "Funk", "Happy", 115, 0.60, 0.85, 0.01, 0.92, 0.08),
    ("Lose Yourself", "Eminem", "Hip Hop", "Energetic", 171, 0.74, 0.69, 0.01, 0.06, 0.26),
    ("Smells Like Teen Spirit", "Nirvana", "Rock", "Energetic", 117, 0.91, 0.50, 0.00, 0.73, 0.07),
    ("Billie Jean", "Michael Jackson", "Pop", "Energetic", 117, 0.65, 0.92, 0.02, 0.84, 0.07),
    ("Stairway to Heaven", "Led Zeppelin", "Rock", "Chill", 82, 0.34, 0.33, 0.58, 0.19, 0.05),
    ("Hotel California", "Eagles", "Rock", "Chill", 147, 0.50, 0.57, 0.00, 0.60, 0.02),
    ("Clair de Lune", "Claude Debussy", "Classical", "Chill", 60, 0.10, 0.15, 0.99, 0.03, 0.04),
    ("Levels", "Avicii", "Electronic", "Energetic", 126, 0.88, 0.58, 0.04, 0.47, 0.03),
    ("Strobe", "deadmau5", "Electronic", "Chill", 128, 0.60, 0.59, 0.05, 0.14, 0.05),
    ("Hallelujah", "Jeff Buckley", "Rock", "Sad", 97, 0.20, 0.33, 0.92, 0.09, 0.03),
    ("Get Lucky", "Daft Punk", "Electronic", "Happy", 116, 0.81, 0.79, 0.04, 0.86, 0.03),
    ("Rolling in the Deep", "Adele", "Pop", "Sad", 105, 0.76, 0.73, 0.13, 0.52, 0.02),
    ("Despacito", "Luis Fonsi", "Pop", "Happy", 89, 0.79, 0.65, 0.22, 0.84, 0.15),
    ("Sweet Child O' Mine", "Guns N' Roses", "Rock", "Energetic", 125, 0.87, 0.45, 0.09, 0.65, 0.05),
    ("Sicko Mode", "Travis Scott", "Hip Hop", "Energetic", 155, 0.73, 0.83, 0.01, 0.44, 0.22),
    ("Sunflower", "Post Malone", "Pop", "Happy", 90, 0.52, 0.76, 0.55, 0.92, 0.05),
    ("God's Plan", "Drake", "Hip Hop", "Happy", 77, 0.45, 0.75, 0.03, 0.35, 0.10),
    ("Nocturne op.9 No.2", "Chopin", "Classical", "Sad", 65, 0.15, 0.20, 0.98, 0.07, 0.04),
    ("Titanium", "David Guetta", "Electronic", "Energetic", 126, 0.85, 0.60, 0.06, 0.30, 0.10),
    ("Thinking Out Loud", "Ed Sheeran", "Pop", "Chill", 79, 0.45, 0.78, 0.47, 0.59, 0.02),
    ("Wonderwall", "Oasis", "Rock", "Chill", 174, 0.85, 0.37, 0.16, 0.43, 0.03),
    ("Radioactive", "Imagine Dragons", "Rock", "Energetic", 136, 0.78, 0.44, 0.10, 0.31, 0.06),
    ("Take Me to Church", "Hozier", "Rock", "Sad", 129, 0.66, 0.56, 0.63, 0.43, 0.04),
    ("Stayin' Alive", "Bee Gees", "Funk", "Happy", 104, 0.82, 0.70, 0.03, 0.95, 0.03),
    ("Wake Me Up", "Avicii", "Electronic", "Happy", 124, 0.78, 0.53, 0.00, 0.64, 0.05),
    ("Bad Guy", "Billie Eilish", "Pop", "Dramatic", 135, 0.43, 0.70, 0.32, 0.56, 0.37),
]

# Generate 970 more synthetic songs to reach 1000 total for a huge dataset
artists = [
    "The Weeknd", "Drake", "Taylor Swift", "Ed Sheeran", "Ariana Grande", 
    "Bad Bunny", "Justin Bieber", "Dua Lipa", "Post Malone", "Billie Eilish", 
    "Eminem", "Bruno Mars", "Coldplay", "Rihanna", "Travis Scott", 
    "Imagine Dragons", "The Chainsmokers", "Maroon 5", "David Guetta", "Calvin Harris",
    "Kanye West", "Kendrick Lamar", "Beyonce", "Lady Gaga", "Adele", "Queen", "Nirvana",
    "Avicii", "Daft Punk", "Skrillex", "Metallica", "AC/DC", "Red Hot Chili Peppers"
]

adjectives = ["Neon", "Midnight", "Electric", "Silent", "Golden", "Dark", "Lost", "Crystal", "Savage", "Sweet"]
nouns = ["Dreams", "City", "Ocean", "Fire", "Night", "Shadows", "Love", "Heart", "Soul", "Vibes"]

for i in range(31, 1001):
    genre = random.choice(genres)
    mood = random.choice(moods)
    tempo = random.randint(60, 180)
    energy = round(random.uniform(0.1, 0.95), 2)
    danceability = round(random.uniform(0.2, 0.9), 2)
    acousticness = round(random.uniform(0.0, 0.9), 2)
    valence = round(random.uniform(0.1, 0.95), 2)  # Positivity
    speechiness = round(random.uniform(0.01, 0.4), 2) # Speech vs music
    
    # Generate a somewhat realistic title
    title = f"{random.choice(adjectives)} {random.choice(nouns)}"
    artist = random.choice(artists)
    
    songs.append((title, artist, genre, mood, tempo, energy, danceability, acousticness, valence, speechiness))

df = pd.DataFrame(songs, columns=["title", "artist", "genre", "mood", "tempo", "energy", "danceability", "acousticness", "valence", "speechiness"])
df['id'] = range(1, len(df) + 1)
df['cover_url'] = df.apply(lambda row: f"https://picsum.photos/seed/{row['id']+2000}/200/200", axis=1)

cols = ["id", "title", "artist", "genre", "mood", "tempo", "energy", "danceability", "acousticness", "valence", "speechiness", "cover_url"]
df = df[cols]

df.to_csv("dataset.csv", index=False)
print(f"Generated {len(df)} songs dataset successfully.")
