# frozen_string_literal: true

module Frontend
  module Nimble
    module Config
      class ConditionsController < Frontend::Nimble::BaseController
        include Deps[markdown: 'markdown']
        include TranslateHelper

        def index
          render json: { conditions: conditions }, status: :ok
        end

        private

        def conditions
          ::Config.data('nimble', 'conditions').transform_values do |value|
            value['name'] = translate(value['name'])
            value['description'] = markdown.call(value: translate(value['description']), version: '0.5.3')
            value
          end
        end
      end
    end
  end
end
