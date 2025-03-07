import { Component } from '@angular/core';
import { NewsItem } from '../../models/news-item';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-bank-news',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './bank-news.component.html',
  styleUrl: './bank-news.component.css'
})
export class BankNewsComponent {
  newsData: NewsItem[] = [
    {
      category: "DIGITAL BANKING",
      title: "Next-Gen Mobile Banking",
      description: "Experience seamless banking with our new mobile app features and enhanced security.",
      imageUrl: "assets/images/HostahavenLogoe-removebg-preview.png",
      buttonText: "Discover Features",
      buttonColor: "#1a365d",
      gradient: "linear-gradient(to right, #1a365d, #2b4c7e)"
    },
    {
      category: "INVESTMENT",
      title: "Smart Portfolio Management",
      description: "Optimize your investments with AI-powered insights and real-time market analysis.",
      imageUrl: "assets/images/HostHaven1.PNG",
      buttonText: "Start Investing",
      buttonColor: "#2f855a",
      gradient: "linear-gradient(to right, #2f855a, #48bb78)"
    },
    {
      category: "SECURITY",
      title: "Enhanced Account Protection",
      description: "New security features to keep your finances safe and secure.",
      imageUrl: "assets/images/HostHaven2.PNG",
      buttonText: "Learn More",
      buttonColor: "#744210",
      gradient: "linear-gradient(to right, #744210, #975a16)"
    },
    {
      category: "SAVINGS",
      title: "High-Yield Savings Accounts",
      description: "Maximize your savings with our competitive interest rates.",
      imageUrl: "assets/images/HostHaven3.PNG",
      buttonText: "Compare Rates",
      buttonColor: "#2b6cb0",
      gradient: "linear-gradient(to right, #2b6cb0, #4299e1)"
    },
    {
      category: "LOANS",
      title: "Flexible Lending Solutions",
      description: "Customized loan options to meet your financial needs.",
      imageUrl: "assets/images/HostHaven4.PNG",
      buttonText: "Apply Now",
      buttonColor: "#702459",
      gradient: "linear-gradient(to right, #702459, #97266d)"
    },
    {
      category: "BUSINESS",
      title: "Corporate Banking Services",
      description: "Comprehensive financial solutions for your business growth.",
      imageUrl: "assets/images/HostHaven1.PNG",
      buttonText: "Explore Services",
      buttonColor: "#285e61",
      gradient: "linear-gradient(to right, #285e61, #319795)"
    }
  ];
}
