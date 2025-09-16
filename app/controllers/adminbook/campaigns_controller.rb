# frozen_string_literal: true

module Adminbook
  class CampaignsController < Adminbook::BaseController
    def index
      @pagy, @campaigns = pagy(Campaign.order(created_at: :desc), limit: 25)
    end
  end
end
