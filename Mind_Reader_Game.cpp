#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <limits>
#include <cctype>
#include <algorithm>
#include <chrono>
#include <thread>
#ifdef _WIN32
#include <windows.h>
#else
#define SetConsoleTextAttribute(h, c)
#endif
using namespace std;

namespace Constants
{
    constexpr int DEFAULT_WIDTH = 60;
    constexpr int SLOW_PRINT_DELAY = 25;
    constexpr int MAX_NAME_LENGTH = 50;
    constexpr const char *HISTORY_FILE = "results.txt";
    constexpr int MAX_ATTEMPTS = 3;
}

class InputException : public exception
{
    string message;

public:
    InputException(const string &msg) : message(msg) {}
    const char *what() const noexcept override { return message.c_str(); }
};

class Console
{
public:
    static void setColor(int color)
    {
#ifdef _WIN32
        HANDLE hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
        if (hConsole == INVALID_HANDLE_VALUE)
        {
            cerr << "Warning: Failed to get console handle" << endl;
            return;
        }
        SetConsoleTextAttribute(hConsole, color);
#endif
    }

    static void slowPrint(const string &text, int delayMs = Constants::SLOW_PRINT_DELAY)
    {
        for (char c : text)
        {
            cout << c << flush;
            this_thread::sleep_for(chrono::milliseconds(delayMs));
        }
    }

    static void drawBox(const string &title, int width = Constants::DEFAULT_WIDTH)
    {
        setColor(11);
        cout << string(width, '-') << "\n";
        int padding = (width - title.length()) / 2;
        cout << string(padding, ' ') << title << string(padding, ' ') << "\n";
        cout << string(width, '-') << "\n";
        setColor(7);
    }

    static void pauseScreen()
    {
        setColor(8);
        cout << "\nPress Enter to continue...";
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        setColor(7);
    }

    static string inputPrompt(const string &prompt, bool allowEmpty = false)
    {
        setColor(10);
        cout << prompt;
        setColor(15);
        string input;
        getline(cin, input);
        if (!allowEmpty && input.empty())
        {
            throw InputException("Input cannot be empty");
        }
        return input;
    }

    static int inputNumber(const string &prompt, int min, int max)
    {
        while (true)
        {
            try
            {
                string input = inputPrompt(prompt);
                int value = stoi(input);
                if (value < min || value > max)
                {
                    throw InputException("Value out of range (" + to_string(min) + "-" + to_string(max) + ")");
                }
                return value;
            }
            catch (const invalid_argument &)
            {
                setColor(12);
                cout << "Error: Please enter a valid number" << endl;
                setColor(7);
            }
            catch (const out_of_range &)
            {
                setColor(12);
                cout << "Error: Number too large or too small" << endl;
                setColor(7);
            }
        }
    }

    static void clearScreen()
    {
#ifdef _WIN32
        system("cls");
#else
        system("clear");
#endif
    }

    static void displayNumberGrid()
    {
        setColor(13);
        cout << "\n✨ Pick a Number Between 1 and 100! ✨\n";
        cout << "┌" << string(58, '─') << "┐\n";
        for (int i = 1; i <= 100; i++)
        {
            if (i % 10 == 1)
                cout << "│ ";
            cout << (i < 10 ? "  " : i < 100 ? " "
                                             : "")
                 << i;
            if (i % 10 == 0)
                cout << " │\n";
            else
                cout << " ";
        }
        cout << "└" << string(58, '─') << "┘\n";
        setColor(7);
    }

    static void displayNumberGuess(const string &number)
    {
        setColor(10);
        cout << "\n🎉🎉 I Guessed Your Number! 🎉🎉\n";
        cout << "  It’s: [" << number << "] from 1 to 100!  \n";
        cout << "  Was I right? 😊\n";
        setColor(7);
    }

    static void displayCrushInitial(const string &initial)
    {
        setColor(13);
        cout << "\n Your Crush’s Initial Unveiled\n";
        cout << "┌─────┐\n";
        cout << "│  " << initial << "  │\n";
        cout << "└─────┘\n";
        cout << "Is this the letter of someone special? 💌\n";
        setColor(7);
    }
};

class Zodiac
{
public:
    static string getSign(int day, int month)
    {
        if (!isValidDate(day, month))
        {
            throw InputException("Invalid date or month");
        }

        static const vector<tuple<int, int, int, int, string>> ranges = {
            {1, 20, 2, 18, "♒ Aquarius"},
            {2, 19, 3, 20, "♓ Pisces"},
            {3, 21, 4, 19, "♈ Aries"},
            {4, 20, 5, 20, "♉ Taurus"},
            {5, 21, 6, 20, "♊ Gemini"},
            {6, 21, 7, 22, "♋ Cancer"},
            {7, 23, 8, 22, "♌ Leo"},
            {8, 23, 9, 22, "♍ Virgo"},
            {9, 23, 10, 22, "♎ Libra"},
            {10, 23, 11, 21, "♏ Scorpio"},
            {11, 22, 12, 21, "♐ Sagittarius"},
            {12, 22, 12, 31, "♑ Capricorn"}};

        for (const auto &range : ranges)
        {
            auto [startMonth, startDay, endMonth, endDay, sign] = range;
            if ((month == startMonth && day >= startDay) ||
                (month == endMonth && day <= endDay))
            {
                return sign;
            }
        }
        return "♑ Capricorn";
    }

private:
    static bool isValidDate(int day, int month)
    {
        if (month < 1 || month > 12 || day < 1 || day > 31)
            return false;
        static const vector<int> daysInMonth = {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
        return day <= daysInMonth[month];
    }
};

class MindReader
{
private:
    string playerName;
    vector<string> months = {"", "January", "February", "March", "April", "May", "June",
                             "July", "August", "September", "October", "November", "December"};

    struct GameMode
    {
        string name;
        int maxValue;
        int bits;
        bool isAlpha;
    };

    int guessByCards(int maxValue, int bits, bool isAlpha = false)
    {
        int result = 0;
        int attempts = 0;

        while (attempts < Constants::MAX_ATTEMPTS)
        {
            try
            {
                for (int i = 0; i < bits; i++)
                {
                    Console::setColor(14);
                    cout << "\nCard #" << i + 1 << " contains:\n";
                    Console::setColor(11);

                    for (int num = 1; num <= maxValue; num++)
                    {
                        if (num & (1 << i))
                        {
                            cout << (isAlpha ? string(1, static_cast<char>('A' + num - 1)) : to_string(num)) << " ";
                        }
                    }

                    string response = Console::inputPrompt("\nIs your choice in this card? (y/n): ");
                    response = tolower(response[0]);
                    while (response != "y" && response != "n")
                    {
                        Console::setColor(12);
                        response = Console::inputPrompt("Invalid input! Please enter 'y' or 'n': ");
                        response = tolower(response[0]);
                    }
                    if (response == "y")
                    {
                        result += (1 << i);
                    }
                }
                return result;
            }
            catch (const InputException &e)
            {
                Console::setColor(12);
                cout << "Error: " << e.what() << endl;
                attempts++;
                if (attempts < Constants::MAX_ATTEMPTS)
                {
                    cout << "Attempts remaining: " << Constants::MAX_ATTEMPTS - attempts << endl;
                    Console::pauseScreen();
                }
            }
        }
        throw InputException("Maximum attempts exceeded");
    }

    void logResult(const string &mode, const string &value)
    {
        ofstream fout(Constants::HISTORY_FILE, ios::app);
        if (!fout)
        {
            cerr << "Error: Failed to write to history file" << endl;
            return;
        }
        auto now = chrono::system_clock::to_time_t(chrono::system_clock::now());
        fout << playerName << " | " << mode << " | " << value << " | " << ctime(&now);
        fout.close();
    }

public:
    MindReader(const string &name)
    {
        if (name.length() > Constants::MAX_NAME_LENGTH)
        {
            throw InputException("Name too long");
        }
        playerName = name.empty() ? "Anonymous" : name;
    }

    void start()
    {
        srand(static_cast<unsigned int>(time(nullptr)));
        static const vector<GameMode> modes = {
            {"Number (1-100)", 100, 7, false},
            {"Alphabet(A-Z)", 26, 5, true},
            {"Age", 100, 7, false},
            {"Birthday Date(1-31)", 31, 5, false},
            {"Birth Month(1-12)", 12, 4, false},
            {"First Letter of Your Crush Name", 26, 5, true}};

        while (true)
        {
            try
            {
                Console::clearScreen();
                Console::drawBox("Mind Reader Game");
                Console::setColor(13);
                cout << "\nWelcome, " << playerName << "! Let’s dive into the magic! ✨\n\n";
                Console::setColor(7);

                for (size_t i = 0; i < modes.size(); ++i)
                {
                    cout << " " << i + 1 << ". " << modes[i].name << "\n";
                }
                cout << " " << modes.size() + 1 << ". Zodiac Sign Calculator\n";
                cout << " " << modes.size() + 2 << ". Show Last Guesses History\n";
                cout << " " << modes.size() + 3 << ". Mystery Mode\n";
                cout << " 0. Exit\n";

                int choice = Console::inputNumber("\nEnter your choice: ", 0, static_cast<int>(modes.size()) + 3);
                if (choice == 0)
                {
                    Console::setColor(14);
                    cout << "\nThanks for playing! Goodbye! 👋\n";
                    Console::setColor(7);
                    return;
                }

                string modeName, guessedStr;
                if (choice == static_cast<int>(modes.size() + 1))
                {
                    modeName = "Zodiac Sign";
                    int month = Console::inputNumber("Enter your birth month (1-12): ", 1, 12);
                    int date = Console::inputNumber("Enter your birth day (1-31): ", 1, 31);
                    guessedStr = Zodiac::getSign(date, month);
                    Console::setColor(10);
                    cout << "\n✨ Your Zodiac Sign is: " << guessedStr << " ✨\n";
                }
                else if (choice == static_cast<int>(modes.size() + 2))
                {
                    Console::clearScreen();
                    Console::drawBox("Guess History");
                    ifstream fin(Constants::HISTORY_FILE);
                    if (!fin)
                    {
                        Console::setColor(12);
                        cout << "No history found.\n";
                    }
                    else
                    {
                        string line;
                        Console::setColor(10);
                        while (getline(fin, line))
                        {
                            cout << line << endl;
                        }
                        fin.close();
                    }
                    Console::pauseScreen();
                    continue;
                }
                else if (choice == static_cast<int>(modes.size() + 3))
                { // Mystery
                    choice = (rand() % modes.size()) + 1;
                    const auto &mode = modes[choice - 1];
                    modeName = mode.name + " (Mystery)";
                    if (mode.name == "Number")
                    {
                        Console::displayNumberGrid();
                    }
                    int guessed = guessByCards(mode.maxValue, mode.bits, mode.isAlpha);
                    guessedStr = mode.isAlpha ? string(1, static_cast<char>('A' + guessed - 1)) : (modeName == "Birth Month (Mystery)" ? months[guessed] : to_string(guessed));
                    if (modeName == "Crush Initial (Mystery)")
                    {
                        Console::displayCrushInitial(guessedStr);
                    }
                    else if (modeName == "Number (Mystery)")
                    {
                        Console::displayNumberGuess(guessedStr);
                    }
                    else
                    {
                        Console::setColor(10);
                        cout << "\n🌟 My Guess is: " << guessedStr << " 🌟\n";
                    }
                }
                else
                {
                    const auto &mode = modes[choice - 1];
                    modeName = mode.name;
                    if (modeName == "Number")
                    {
                        Console::displayNumberGrid();
                    }
                    int guessed = guessByCards(mode.maxValue, mode.bits, mode.isAlpha);
                    guessedStr = mode.isAlpha ? string(1, static_cast<char>('A' + guessed - 1)) : (modeName == "Birth Month" ? months[guessed] : to_string(guessed));
                    if (modeName == "Crush Initial")
                    {
                        Console::displayCrushInitial(guessedStr);
                    }
                    else if (modeName == "Number")
                    {
                        Console::displayNumberGuess(guessedStr);
                    }
                    else
                    {
                        Console::setColor(10);
                        cout << "\n🌟 My Guess is: " << guessedStr << " 🌟\n";
                    }
                }

                logResult(modeName, guessedStr);
                Console::pauseScreen();
            }
            catch (const InputException &e)
            {
                Console::setColor(12);
                cout << "Error: " << e.what() << endl;
                Console::pauseScreen();
            }
            catch (const exception &e)
            {
                Console::setColor(12);
                cout << "Unexpected error: " << e.what() << endl;
                Console::pauseScreen();
            }
        }
    }
};

int main()
{
    try
    {
        Console::clearScreen();
        Console::drawBox("Ultimate Mind Reader - C++ OOP Project");
        Console::setColor(14);
        cout << "\n Welcome to the Mind Reader Adventure! \n";
        Console::slowPrint("Enter your name: ");
        string name = Console::inputPrompt("", true);
        transform(name.begin(), name.end(), name.begin(), ::toupper);
        MindReader game(name);
        game.start();
    }
    catch (const exception &e)
    {
        Console::setColor(12);
        cout << "Fatal error: " << e.what() << endl;
        return 1;
    }
    return 0;
}