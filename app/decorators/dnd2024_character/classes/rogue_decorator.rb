# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class RogueDecorator < ApplicationDecorator
      CLASS_SAVE_DC = %w[dex int].freeze

      def class_save_dc
        @class_save_dc ||= main_class == 'rogue' ? CLASS_SAVE_DC : __getobj__.class_save_dc
      end
    end
  end
end
