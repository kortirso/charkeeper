# frozen_string_literal: true

module Adminbook
  class FeedbacksController < Adminbook::BaseController
    def index
      @feedbacks = User::Feedback.includes(:user).order(created_at: :desc)
    end
  end
end
