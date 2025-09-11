# frozen_string_literal: true

module Dnd2024Character
  module Subclasses
    class CollegeOfValorDecorator < ApplicationDecorator
      def attacks_per_action
        @attacks_per_action ||= class_level >= 6 ? 2 : 1
      end

      private

      def class_level
        classes['bard']
      end
    end
  end
end
