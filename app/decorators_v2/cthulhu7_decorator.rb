# frozen_string_literal: true

class Cthulhu7Decorator < ApplicationDecoratorV2
  include TranslateHelper

  def call(character:, simple: false, version: nil)
    @character = character
    @version = version
    @result = character.data.attributes

    generate_basis
    return self if simple

    self
  end

  private

  def generate_basis
    @result['name'] = @character.name
  end
end
