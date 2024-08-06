#include <iostream>
#include <array>
#include <cmath>




/*
* Program Name: Turning Moore Engineering Land Cost Calculator 
* Programmer: Cody James
* Date: 05/08/2024
* Version:1/8
* Description: A calculator to figure out what the cost of your house is with several variables
*               and how it stacks up against other houses in the same neighbourhood.
*/

//Lets just do some testing to make sure the basics work


    //attempt to make a struct


int main()
{
    std::string Dimention;
    std::string Name;
    char houseresponse;
    char Confirmation;
    char Choice;
    float Width;
    float Length;
    float Land = Width * Length;
    float Price, FinalPrice;
    int nowday, nowmonth, nowyear;
    int birthday, birthmonth, birthyear;
    int age;
    int sellpostcode;
    int priceperm;
    int medianprice;
    int floors, bedrooms, bathrooms, livingrooms;
    int floor, bed, bath, living;




    //Introduction and first steps towards P
    std::cout << "Welcome to the Turning Moore Engineering Land Cost Calculator 1.0.\n";
    std::cout << "Cody James.\nStudent Number: \n";
    std::cout << "04/08/2024.\nHD.\n"; 
    /* using multiple lines of code allows me to use the right hand side of the 
    screen in double mode so that I can check against notes*/
    std::cout << "Follow the prompts entering one line at a time before you hit the enter key.\n";
    std::cout << "Don't worry if nothing is returned, you can double check the data at the end\n";

    //Move onto the user details

    //LOOP ONE 
    //MAIN LOOP

    int loop = 1;
    while (loop==1)
    {
    //SMALL LOOP
    //Just to use for the first check to make sure the initial details are correct
    int smallloop =1;
    while (smallloop==1)
    {
    //start gathering data
    std::cout << "\nLets start off with your name\n";
    std::cin >> Name;

    //Todays Date

    std::cout << "\nWhat is the date today? Day number (##): \n";
    std::cin >> nowday;
    std::cout << "\nMonth number (##): \n";
    std::cin >> nowmonth;
    std::cout << "\nYear number (####): \n";
    std::cin >> nowyear;
    std::cout << nowday <<"/" << nowmonth << "/" << nowyear;

    //Birthday

    std::cout << "\nNow, what date were you born?\n";
    std::cout << "\nwhat date ##?\n";
    std::cin >> birthday;
    std::cout << "\nWhat month ##?\n";
    std::cin >> birthmonth;
    std::cout << "\nWhat year ####?\n";
    std::cin >> birthyear;
    std::cout << birthday << "/" << birthmonth << "/" << birthyear << "\n";

     //Finding out how old you are :)
        age = nowyear - birthyear;
   
    if (nowday - birthday <0)
    {
        nowmonth = nowmonth -1;
    }
    if (nowmonth - birthmonth < 0)
    {
        age = age -1;
    }

    //Postcode generator 
    std::cout << "\nWhat is the postcode of the land you're trying to sell?\n";
    std::cin >> sellpostcode;
    switch (sellpostcode)
    {
        case 3214:
            priceperm = 747;
            medianprice = 262000;
        case 3215:
            priceperm = 951;
            medianprice = 333000;
        case 3216:
            priceperm = 781;
            medianprice = 273500;
        case 3217:
            priceperm = 834;
            medianprice = 292000;
        case 3218:
            priceperm = 418;
            medianprice = 146500;
        case 3219:
            priceperm = 874;
            medianprice = 306000;
        case 3220:
            priceperm = 420;
            medianprice = 147300;
        default:
            priceperm = 834;
            medianprice = 250000; 
    }
    std::cout << "\nSo your price per square meter is: $" << priceperm << "\nand the median price for your suburb is: $" << medianprice;


    //house speficiations
    std::cout << "\n\nWhat is the width and length of your block\nWe'll ask for the units later so don't worry about that\n";
    std::cout << "\nWidth?\n";
    std::cin >> Width;
    std::cout << "\nLength?\n";
    std::cin >> Length;
    std::cout << "\nwas that in meters (m), centimeters (cm) or millimeters (mm)\n";
    std::cin >> Dimention;
    
        Land = Width * Length;
  
    if (Dimention == "mm")
    {
        Land = Land/1000;
    }

    else if (Dimention == "cm")
    {
        Land = Land/100;
    }

    else if (Dimention == "m")
    {
        Land = Land;
    }
        Price = Land * 834;


    //Addons for the house

    std::cout <<"\nIs there a house on your land? ";
    std::cin >> houseresponse;
    switch (houseresponse)
    {
        case 'y':
        case 'Y':
            std::cout << "\nHow many stories is the house?\n";
            std::cin >> floors;
            std::cout << "\nHow many bedrooms?\n";
            std::cin >> bedrooms;
            std::cout << "\nHow many bathrooms?\n";
            std::cin >> bathrooms;
            std::cout << "\nHow many living areas/living rooms?\n";
            std::cin >> livingrooms;
            std::cout << "so you have \n" << floors << "\n" << bedrooms << "\n" << bathrooms << "\n" << livingrooms;
        default:
            break;
    }
        floor = floors * 175000;
        bed = bedrooms * 25000;
        bath = bathrooms * 40000;
        living = livingrooms * 33000;

    std::cout << "\nSo your name and land size is:\n"  << Name << "\n" << Land<< " meters^2\n" << "Correct?\nY to confirm\n"; 
    //Confirmation switch to return or keep going
    switch (Confirmation)
    {
        case 'y':
        case 'Y':
            smallloop = 0;
    }
    


    }
    //BREAK SMALL LOOP
    FinalPrice = Price + floor + bed + bath +living;

    std::cout << "Amazing!\nThe value of your property is \n$" << FinalPrice;

    if (FinalPrice > medianprice)
    {
        std::cout << "\nYour house is above the median block price!";
    }
    else if (FinalPrice < medianprice)
    {
        std::cout << "\nYour price is below the median block price";
    }
    //User choice

    std::cout << "\nWould you like to continue and add another property\nPress C to continue the program or E to exit\n";
    std::cin >> Choice;
    switch (Choice)
    {   case 'e':
        case 'E':
            loop = 0;
            break;

        case 'c':
        case 'C':
            std::cout << "Okay, taking you back to the start!\n";
    }
}}