import { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { formatCurrency } from '@/data/currencies';
import { getCategoryById, getCategoriesByType } from '@/data/categories';

export const AIChat = () => {
  const { 
    chatHistory, 
    addChatMessage, 
    clearChatHistory,
    transactions,
    loans,
    committees,
    savingsGoals,
    addTransaction,
    defaultCurrency
  } = useFinance();
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const getAIResponse = (userMessage: string) => {
    const msg = userMessage.toLowerCase();
    
    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalSavings = transactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses - totalSavings;

    // Check for expense patterns
    const expenseMatch = msg.match(/(?:spent|paid|expense|bought)\s+(?:rs\.?|pkr)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:rs\.?|pkr)?\s*(?:on|for)?\s*(.*)/i);
    const incomeMatch = msg.match(/(?:received|got|earned|income)\s+(?:rs\.?|pkr)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:rs\.?|pkr)?\s*(?:from|as)?\s*(.*)/i);

    if (expenseMatch) {
      const amount = parseFloat(expenseMatch[1].replace(/,/g, ''));
      const description = expenseMatch[2]?.trim() || 'Expense';
      
      // Try to determine category from description
      let categoryId = 'other-expense';
      const desc = description.toLowerCase();
      if (desc.includes('grocery') || desc.includes('groceries') || desc.includes('sabzi') || desc.includes('vegetables')) {
        categoryId = 'groceries';
      } else if (desc.includes('food') || desc.includes('restaurant') || desc.includes('lunch') || desc.includes('dinner')) {
        categoryId = 'food';
      } else if (desc.includes('petrol') || desc.includes('fuel') || desc.includes('transport') || desc.includes('uber') || desc.includes('careem')) {
        categoryId = 'transport';
      } else if (desc.includes('electric') || desc.includes('gas') || desc.includes('water') || desc.includes('bill')) {
        categoryId = 'utilities';
      } else if (desc.includes('medicine') || desc.includes('doctor') || desc.includes('hospital') || desc.includes('medical')) {
        categoryId = 'healthcare';
      } else if (desc.includes('school') || desc.includes('tuition') || desc.includes('education') || desc.includes('books')) {
        categoryId = 'education';
      } else if (desc.includes('clothes') || desc.includes('clothing') || desc.includes('shirt') || desc.includes('dress')) {
        categoryId = 'clothing';
      } else if (desc.includes('mobile') || desc.includes('phone') || desc.includes('internet') || desc.includes('wifi')) {
        categoryId = 'mobile';
      } else if (desc.includes('baby') || desc.includes('diaper') || desc.includes('formula') || desc.includes('kids')) {
        categoryId = 'kids';
      }

      addTransaction({
        type: 'expense',
        amount,
        currency: defaultCurrency,
        category: categoryId,
        description: description.charAt(0).toUpperCase() + description.slice(1),
        date: new Date().toISOString().split('T')[0],
      });

      const category = getCategoryById(categoryId);
      return `✅ I've recorded your expense:\n\n**Amount:** ${formatCurrency(amount, defaultCurrency)}\n**Category:** ${category?.name || 'Other'}\n**Description:** ${description}\n\nYour updated balance is ${formatCurrency(balance - amount, defaultCurrency)}. Would you like me to help with anything else?`;
    }

    if (incomeMatch) {
      const amount = parseFloat(incomeMatch[1].replace(/,/g, ''));
      const description = incomeMatch[2]?.trim() || 'Income';
      
      let categoryId = 'other-income';
      const desc = description.toLowerCase();
      if (desc.includes('salary') || desc.includes('office') || desc.includes('job')) {
        categoryId = 'salary';
      } else if (desc.includes('freelance') || desc.includes('project') || desc.includes('client')) {
        categoryId = 'freelance';
      } else if (desc.includes('business')) {
        categoryId = 'business';
      }

      addTransaction({
        type: 'income',
        amount,
        currency: defaultCurrency,
        category: categoryId,
        description: description.charAt(0).toUpperCase() + description.slice(1),
        date: new Date().toISOString().split('T')[0],
      });

      return `✅ Great! I've recorded your income:\n\n**Amount:** ${formatCurrency(amount, defaultCurrency)}\n**Description:** ${description}\n\nYour updated balance is ${formatCurrency(balance + amount, defaultCurrency)}. Keep up the good work!`;
    }

    // Summary queries
    if (msg.includes('summary') || msg.includes('overview') || msg.includes('how am i doing') || msg.includes('status')) {
      const pendingLoans = loans.filter(l => !l.isSettled);
      const activeCommittees = committees.filter(c => c.status === 'active');
      
      return `📊 **Here's your financial summary:**\n\n` +
        `💰 **Total Income:** ${formatCurrency(totalIncome, defaultCurrency)}\n` +
        `💸 **Total Expenses:** ${formatCurrency(totalExpenses, defaultCurrency)}\n` +
        `🏦 **Total Savings:** ${formatCurrency(totalSavings, defaultCurrency)}\n` +
        `📈 **Current Balance:** ${formatCurrency(balance, defaultCurrency)}\n\n` +
        `📋 **Pending Loans:** ${pendingLoans.length}\n` +
        `🤝 **Active Committees:** ${activeCommittees.length}\n\n` +
        (balance > 0 
          ? `You're doing well! Your expenses are under control.` 
          : `⚠️ Your expenses have exceeded your income. Let's work on a budget plan.`);
    }

    // Expense breakdown
    if (msg.includes('where') && (msg.includes('spend') || msg.includes('money go') || msg.includes('spending'))) {
      const expensesByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      const sorted = Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      let response = `📊 **Your Top Spending Categories:**\n\n`;
      sorted.forEach(([catId, amount], i) => {
        const cat = getCategoryById(catId);
        const percent = ((amount / totalExpenses) * 100).toFixed(1);
        response += `${i + 1}. **${cat?.name || catId}**: ${formatCurrency(amount, defaultCurrency)} (${percent}%)\n`;
      });
      
      response += `\n💡 **Tip:** Your highest spending is on ${getCategoryById(sorted[0]?.[0])?.name || 'various categories'}. Consider setting a budget for it!`;
      return response;
    }

    // Savings advice
    if (msg.includes('save') || msg.includes('savings') || msg.includes('saving money')) {
      const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : 0;
      
      let advice = `🏦 **Savings Analysis:**\n\n`;
      advice += `Current savings rate: **${savingsRate}%** of income\n\n`;
      
      if (parseFloat(savingsRate as string) < 10) {
        advice += `📌 **Recommendation:** Your savings rate is low. Here's how to improve:\n\n`;
        advice += `1. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings\n`;
        advice += `2. Set up automatic savings on payday\n`;
        advice += `3. Start with saving just Rs. 1,000 per week\n\n`;
        advice += `With your new baby coming, aim to save at least Rs. 10,000-15,000 monthly for baby expenses!`;
      } else if (parseFloat(savingsRate as string) < 20) {
        advice += `👍 You're on the right track! To reach the recommended 20%, try:\n\n`;
        advice += `1. Review subscriptions you don't use\n`;
        advice += `2. Cook more at home\n`;
        advice += `3. Use cash envelopes for discretionary spending`;
      } else {
        advice += `🌟 **Excellent!** You're saving more than 20% of your income. Keep it up!\n\n`;
        advice += `Consider investing some savings for better returns.`;
      }
      
      return advice;
    }

    // Loan queries
    if (msg.includes('loan') || msg.includes('owe') || msg.includes('debt')) {
      const loansGiven = loans.filter(l => l.type === 'given' && !l.isSettled);
      const loansTaken = loans.filter(l => l.type === 'taken' && !l.isSettled);
      
      const totalGiven = loansGiven.reduce((sum, l) => sum + l.amount - l.payments.reduce((s, p) => s + p.amount, 0), 0);
      const totalTaken = loansTaken.reduce((sum, l) => sum + l.amount - l.payments.reduce((s, p) => s + p.amount, 0), 0);
      
      let response = `📋 **Loan Summary:**\n\n`;
      response += `**Money You've Given:** ${formatCurrency(totalGiven, defaultCurrency)} (${loansGiven.length} pending)\n`;
      response += `**Money You Owe:** ${formatCurrency(totalTaken, defaultCurrency)} (${loansTaken.length} pending)\n\n`;
      
      if (loansGiven.length > 0) {
        response += `**People who owe you:**\n`;
        loansGiven.forEach(l => {
          const remaining = l.amount - l.payments.reduce((s, p) => s + p.amount, 0);
          response += `• ${l.personName}: ${formatCurrency(remaining, l.currency)}\n`;
        });
      }
      
      return response;
    }

    // Committee queries
    if (msg.includes('committee') || msg.includes('kameti') || msg.includes('komiti')) {
      const active = committees.filter(c => c.status === 'active');
      
      if (active.length === 0) {
        return `📋 You don't have any active committees right now. Would you like me to help you understand how committees work or add one?`;
      }

      let response = `🤝 **Active Committees:**\n\n`;
      active.forEach(c => {
        const totalPayout = c.totalMembers * c.monthlyAmount;
        const monthsLeft = c.myPayoutMonth - c.currentMonth;
        response += `**${c.name}**\n`;
        response += `• Monthly: ${formatCurrency(c.monthlyAmount, c.currency)}\n`;
        response += `• Total Payout: ${formatCurrency(totalPayout, c.currency)}\n`;
        response += `• Your turn: Month ${c.myPayoutMonth} (${monthsLeft > 0 ? monthsLeft + ' months away' : 'Due now!'})\n\n`;
      });
      
      return response;
    }

    // Budget help
    if (msg.includes('budget') || msg.includes('plan')) {
      const monthlyIncome = totalIncome / 6; // Assuming 6 months of data
      
      return `📝 **Here's a suggested monthly budget for your family:**\n\n` +
        `Based on your income pattern:\n\n` +
        `🏠 **Essentials (50%):** ${formatCurrency(monthlyIncome * 0.5, defaultCurrency)}\n` +
        `  • Rent/Utilities\n` +
        `  • Groceries\n` +
        `  • Transport\n` +
        `  • Healthcare\n\n` +
        `🎯 **Wants (30%):** ${formatCurrency(monthlyIncome * 0.3, defaultCurrency)}\n` +
        `  • Dining out\n` +
        `  • Entertainment\n` +
        `  • Shopping\n\n` +
        `💰 **Savings (20%):** ${formatCurrency(monthlyIncome * 0.2, defaultCurrency)}\n` +
        `  • Emergency fund\n` +
        `  • Baby preparation\n` +
        `  • Future goals\n\n` +
        `Would you like me to help set up budgets for specific categories?`;
    }

    // Help/greeting
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('help') || msg.includes('salam') || msg === '') {
      return `👋 Assalam o Alaikum! I'm your personal finance assistant. Here's what I can help you with:\n\n` +
        `💬 **Quick Commands:**\n` +
        `• "Spent Rs. 500 on groceries" - Add expense\n` +
        `• "Received 50000 salary" - Add income\n` +
        `• "Show my summary" - Financial overview\n` +
        `• "Where does my money go?" - Spending analysis\n` +
        `• "Help me save" - Savings tips\n` +
        `• "Show my loans" - Loan summary\n` +
        `• "My committees" - Committee status\n` +
        `• "Create a budget" - Budget planning\n\n` +
        `Just type naturally, I'll understand! 😊`;
    }

    // Default response
    return `I'm here to help with your finances! Try asking me:\n\n` +
      `• "How am I doing financially?"\n` +
      `• "I spent 2000 on groceries"\n` +
      `• "Show my spending breakdown"\n` +
      `• "Help me save money"\n\n` +
      `Or just tell me about an expense or income naturally!`;
  };

  const MAX_MESSAGE_LENGTH = 500;
  
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    
    // Validate message length
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      // Silently truncate - the store also enforces this limit
      console.warn(`Message truncated from ${trimmed.length} to ${MAX_MESSAGE_LENGTH} characters`);
    }

    const messageToSend = trimmed.slice(0, MAX_MESSAGE_LENGTH);

    // Add user message
    addChatMessage({
      role: 'user',
      content: messageToSend,
    });

    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = getAIResponse(messageToSend);
      addChatMessage({
        role: 'assistant',
        content: response,
      });
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-soft">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Finance AI</h2>
            <p className="text-xs text-muted-foreground">Your personal guide</p>
          </div>
        </div>
        {chatHistory.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChatHistory}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="p-4 rounded-2xl bg-primary-soft mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Welcome!</h3>
            <p className="text-muted-foreground text-sm">
              I'm your personal finance assistant. Tell me about your expenses, 
              ask for advice, or get a summary of your finances.
            </p>
            <div className="mt-6 space-y-2 w-full max-w-xs">
              {[
                'Show my summary',
                'Help me save money',
                'Where does my money go?'
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  className="w-full p-3 text-left text-sm rounded-xl border border-border hover:bg-secondary transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3',
                msg.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              <div className={cn(
                'p-2 rounded-xl h-fit',
                msg.role === 'user' ? 'bg-primary' : 'bg-secondary'
              )}>
                {msg.role === 'user' 
                  ? <User className="h-4 w-4 text-primary-foreground" />
                  : <Bot className="h-4 w-4 text-secondary-foreground" />
                }
              </div>
              <div className={cn(
                'max-w-[80%] p-3 rounded-2xl',
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                  : 'bg-card border rounded-tl-sm'
              )}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={cn(
                  'text-[10px] mt-1',
                  msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                  {format(new Date(msg.timestamp), 'HH:mm')}
                </p>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="p-2 rounded-xl bg-secondary h-fit">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-card border rounded-2xl rounded-tl-sm p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
