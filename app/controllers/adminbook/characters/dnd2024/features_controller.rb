# frozen_string_literal: true

module Adminbook
  module Characters
    module Dnd2024
      class FeaturesController < Adminbook::BaseController
        def index
          @features = ::Dnd2024::Character::Feature.order(origin: :asc, origin_value: :asc, level: :asc)
        end

        def edit
          @feature = ::Dnd2024::Character::Feature.find(params[:id])
        end
      end
    end
  end
end
