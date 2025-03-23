
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AnalysisChartProps {
  score: number;
}

const AnalysisChart = ({ score }: AnalysisChartProps) => {
  // Convert score (0-100) to data for pie chart
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score }
  ];

  // Define colors based on score
  let color;
  if (score >= 80) {
    color = '#10b981'; // green for high scores
  } else if (score >= 60) {
    color = '#f59e0b'; // amber for medium scores
  } else {
    color = '#ef4444'; // red for low scores
  }

  const COLORS = [color, '#f3f4f6'];

  const renderCustomizedLabel = () => {
    return (
      <text 
        x="50%" 
        y="50%" 
        fill={color}
        textAnchor="middle" 
        dominantBaseline="middle"
        className="text-3xl font-bold"
      >
        {score}
      </text>
    );
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={90}
            endAngle={450}
            paddingAngle={0}
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                strokeWidth={index === 0 ? 1 : 0}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [
              name === "Score" ? `${value}%` : null, 
              name === "Score" ? "ATS Score" : null
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalysisChart;
