# frozen_string_literal: true

module Adminbook
  module Daggerheart
    module Homebrew
      class TransformationsController < Adminbook::BaseController
        def index
          @pagy, @transformations = pagy(::Daggerheart::Homebrew::Transformation.order(created_at: :desc), limit: 25)
        end
      end
    end
  end
end
