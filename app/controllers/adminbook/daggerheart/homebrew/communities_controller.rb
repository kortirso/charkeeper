# frozen_string_literal: true

module Adminbook
  module Daggerheart
    module Homebrew
      class CommunitiesController < Adminbook::BaseController
        def index
          @pagy, @communities = pagy(::Daggerheart::Homebrews::Community.order(created_at: :desc), limit: 25)
        end
      end
    end
  end
end
