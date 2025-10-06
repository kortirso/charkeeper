# frozen_string_literal: true

module Adminbook
  module Daggerheart
    module Homebrew
      class SpecialitiesController < Adminbook::CharactersController
        def index
          @pagy, @specialities = pagy(::Daggerheart::Homebrew::Speciality.order(created_at: :desc), limit: 25)
        end
      end
    end
  end
end
