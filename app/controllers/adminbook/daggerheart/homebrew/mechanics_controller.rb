# frozen_string_literal: true

module Adminbook
  module Daggerheart
    module Homebrew
      class MechanicsController < Adminbook::BaseController
        def index
          @pagy, @mechanics = pagy(::Daggerheart::Homebrews::Mechanic.order(created_at: :desc), limit: 25)
        end
      end
    end
  end
end
