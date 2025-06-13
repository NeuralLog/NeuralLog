package http

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"time"

	"github.com/NeuralLog/go-sdk/neurallog/models"
)

// Client is an HTTP client for the NeuralLog API.
type Client struct {
	config     *models.Config
	httpClient *http.Client
}

// NewClient creates a new HTTP client with the specified configuration.
func NewClient(config *models.Config) *Client {
	transport := &http.Transport{
		MaxIdleConns:        config.MaxConnections,
		MaxIdleConnsPerHost: config.MaxConnections,
	}

	httpClient := &http.Client{
		Transport: transport,
		Timeout:   config.Timeout,
	}

	return &Client{
		config:     config,
		httpClient: httpClient,
	}
}

// Send sends an HTTP request to the NeuralLog API.
func (c *Client) Send(method, path string, data string) (map[string]interface{}, error) {
	// Build the URL
	url := c.config.ServerURL + path

	// Create the request
	var body io.Reader
	if data != "" {
		body = bytes.NewBufferString(data)
	}
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	if c.config.APIKey != "" {
		req.Header.Set("X-API-Key", c.config.APIKey)
	}
	for k, v := range c.config.Headers {
		req.Header.Set(k, v)
	}

	// Send the request with retries
	var resp *http.Response
	var lastErr error
	for i := 0; i <= c.config.MaxRetries; i++ {
		resp, err = c.httpClient.Do(req)
		if err == nil && resp.StatusCode < 500 {
			break
		}

		if err != nil {
			lastErr = err
			if c.config.DebugEnabled {
				fmt.Printf("Request failed: %v\n", err)
			}
		} else {
			lastErr = fmt.Errorf("server error: %s", resp.Status)
			if c.config.DebugEnabled {
				fmt.Printf("Server error: %s\n", resp.Status)
			}
			resp.Body.Close()
		}

		if i < c.config.MaxRetries {
			// Calculate backoff with exponential increase
			backoff := c.config.RetryBackoff * time.Duration(math.Pow(2, float64(i)))
			if c.config.DebugEnabled {
				fmt.Printf("Retrying in %v...\n", backoff)
			}
			time.Sleep(backoff)
		}
	}

	if resp == nil {
		return nil, fmt.Errorf("request failed after %d retries: %w", c.config.MaxRetries, lastErr)
	}
	defer resp.Body.Close()

	// Handle 204 No Content
	if resp.StatusCode == http.StatusNoContent {
		return map[string]interface{}{}, nil
	}

	// Parse the response
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return result, nil
}
