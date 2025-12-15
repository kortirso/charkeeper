# frozen_string_literal: true

module Dc20Character
  class OverallDecorator < ApplicationDecorator
    def health
      @health ||= __getobj__.health.merge(
        'max' => max_health,
        'bloodied' => max_health / 2,
        'well_bloodied' => max_health / 4
      )
    end
  end
end
