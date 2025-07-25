package cmd

import (
	"fmt"
	"os"
	"time"

	"github.com/spf13/cobra"

	conf "github.com/muety/wakapi/config"
	"github.com/muety/wakapi/internal/utilities"
	"github.com/muety/wakapi/services"
)

var generateLeaderboardsCmd = &cobra.Command{
	Use:   "generate-leaderboards",
	Short: "Generate leaderboards for the 7-day period ending on the most recent Sunday",
	Long: `Generate leaderboards for ALL users regardless of their leaderboard settings.

This command generates leaderboards for a 7-day period that ends on the most recent Sunday at 23:59:59.
For example, if run on a Wednesday, it will generate leaderboards for the 7-day period ending on the previous Sunday.
If run on a Sunday, it will generate leaderboards for the 7-day period ending on the previous Sunday.

This ensures consistent weekly leaderboard periods that align with calendar weeks.
All users are included in the leaderboard generation, even if they have disabled leaderboards in their settings.`,
	Run: func(cmd *cobra.Command, args []string) {
		generateLeaderboards()
	},
}

func init() {
	rootCmd.AddCommand(generateLeaderboardsCmd)

	generateLeaderboardsCmd.Flags().StringVar(&cfgFile, "config", conf.DefaultConfigPath, fmt.Sprintf("config file (default is %s)", conf.DefaultConfigPath))
}

func generateLeaderboards() {
	config := conf.Load(cfgFile, "0.00.01")
	
	if !config.App.LeaderboardEnabled {
		fmt.Println("Leaderboards are disabled in configuration. Enable them to generate leaderboards.")
		os.Exit(1)
		return
	}
	
	db, sqlDB, err := utilities.InitDB(config)
	if err != nil {
		conf.Log().Fatal("could not connect to database", "error", err)
		os.Exit(1)
		return
	}
	defer sqlDB.Close()

	// Create services
	services := services.NewServices(db)
	leaderboardService := services.LeaderBoard()

	executionStart := time.Now()
	if err := leaderboardService.GenerateWeeklyLeaderboards(); err != nil {
		conf.Log().Error("failed to generate leaderboards", "error", err)
		fmt.Printf("Error: Failed to generate leaderboards: %v\n", err)
		os.Exit(1)
	}

	duration := time.Since(executionStart)
	fmt.Printf("Successfully generated leaderboards for all eligible users in %v.\n", duration)
}