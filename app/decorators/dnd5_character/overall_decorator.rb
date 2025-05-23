# frozen_string_literal: true

module Dnd5Character
  class OverallDecorator < ApplicationDecorator
    def save_dc
      @save_dc ||= begin
        result = __getobj__.save_dc
        class_save_dc.each do |class_saving_throw|
          result[class_saving_throw] += proficiency_bonus
        end
        result
      end
    end
  end
end
