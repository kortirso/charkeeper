# frozen_string_literal: true

module Characters
  class BonusSerializer < ApplicationSerializer
    attributes :id, :value, :dynamic_value, :comment, :enabled
  end
end
