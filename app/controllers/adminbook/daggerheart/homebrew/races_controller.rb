# frozen_string_literal: true

module Adminbook
  module Daggerheart
    module Homebrew
      class RacesController < Adminbook::BaseController
        def index
          @pagy, @races = pagy(::Daggerheart::Homebrew::Race.order(created_at: :desc), limit: 25)
        end
      end
    end
  end
end
