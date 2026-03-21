# frozen_string_literal: true

module Dnd2024
  module Species
    class ElfDecorator < ApplicationDecoratorV2
      def call(result:)
        result['darkvision'] = 60
        result
      end
    end
  end
end
