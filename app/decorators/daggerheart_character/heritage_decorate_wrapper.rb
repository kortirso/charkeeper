# frozen_string_literal: true

module DaggerheartCharacter
  class HeritageDecorateWrapper < ApplicationDecorateWrapper
    private

    def wrap_classes(obj)
      case obj.heritage
      when Daggerheart::Character::ELF then DaggerheartCharacter::Heritages::ElfDecorator.new(obj)
      else ApplicationDecorator.new(obj)
      end
    end
  end
end
