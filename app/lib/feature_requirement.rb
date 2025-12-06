# frozen_string_literal: true

class FeatureRequirement
  def call(current:, initial:)
    return false if current.blank?

    Gem::Version.new(current) >= Gem::Version.new(initial)
  end
end
