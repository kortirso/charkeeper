# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class FighterDecorator < ApplicationDecorator
      CLASS_SAVE_DC = %w[str com].freeze

      def class_save_dc
        @class_save_dc ||= main_class == 'fighter' ? CLASS_SAVE_DC : __getobj__.class_save_dc
      end
    end
  end
end
