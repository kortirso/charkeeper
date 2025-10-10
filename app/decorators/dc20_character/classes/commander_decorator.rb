# frozen_string_literal: true

module Dc20Character
  module Classes
    class CommanderDecorator < ApplicationDecorator
      def health
        @health ||= __getobj__.health.merge('max' => 6 + (3 * class_level) + modified_abilities['mig'])
      end

      private

      def class_level
        @class_level ||= classes['commander']
      end
    end
  end
end
