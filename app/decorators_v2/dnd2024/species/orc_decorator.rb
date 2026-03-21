# frozen_string_literal: true

module Dnd2024
  module Species
    class OrcDecorator < ApplicationDecoratorV2
      def call(result:)
        result['darkvision'] = 120
        result
      end
    end
  end
end
