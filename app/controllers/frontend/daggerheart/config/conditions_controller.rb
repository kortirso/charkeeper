# frozen_string_literal: true

module Frontend
  module Daggerheart
    module Config
      class ConditionsController < Frontend::BaseController
        include Deps[markdown: 'markdown']
        include TranslateHelper

        def index
          render json: { conditions: conditions }, status: :ok
        end

        private

        def conditions
          ::Config.data('daggerheart', 'conditions').transform_values do |value|
            value['name'] = translate(value['name'])
            value['description'] = markdown.call(value: translate(value['description']), version: '0.4.9')
            value
          end
        end
      end
    end
  end
end
