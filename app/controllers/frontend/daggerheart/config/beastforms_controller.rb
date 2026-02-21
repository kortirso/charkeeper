# frozen_string_literal: true

module Frontend
  module Daggerheart
    module Config
      class BeastformsController < Frontend::BaseController
        skip_before_action :authenticate
        skip_before_action :set_locale

        def index
          render json: {
            beastforms: ::Config.data('daggerheart', 'beastforms'),
            advantages: ::Config.data('daggerheart', 'advantages')
          }, status: :ok
        end
      end
    end
  end
end
