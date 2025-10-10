# frozen_string_literal: true

module Adminbook
  module Daggerheart
    module Homebrew
      class SubclassesController < Adminbook::BaseController
        def index
          @pagy, @subclasses = pagy(::Daggerheart::Homebrew::Subclass.order(created_at: :desc), limit: 25)
        end
      end
    end
  end
end
