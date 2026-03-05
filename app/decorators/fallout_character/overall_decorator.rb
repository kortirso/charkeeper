# frozen_string_literal: true

module FalloutCharacter
  class OverallDecorator < ApplicationDecorator
    def carry_weight
      150 + (modified_abilities['str'] * 10)
    end

    def initiative
      modified_abilities['per'] + modified_abilities['agi']
    end

    def defense
      modified_abilities['agi'] >= 9 ? 2 : 1
    end
  end
end
