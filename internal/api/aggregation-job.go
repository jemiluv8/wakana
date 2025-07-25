package api

import (
	"context"

	datastructure "github.com/duke-git/lancet/v2/datastructure/set"
	"github.com/riverqueue/river"
)

type AggregationArgs struct{}

func (AggregationArgs) Kind() string { return "aggregation" }

func (a *APIv1) aggregationWorker(_ context.Context, _ *river.Job[AggregationArgs]) error {
	// Run aggregation for all users (empty set means all users)
	return a.services.Aggregation().AggregateSummaries(datastructure.New[string]())
}