# frozen_string_literal: true

module Characters
  class BonusSerializer < ApplicationSerializer
    attributes :id, :value, :comment
  end
end
