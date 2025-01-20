# frozen_string_literal: true

module Dnd5
  class CharacterSerializer < ApplicationSerializer
    attributes :object_data, :decorated_data, :provider, :user_character_id

    delegate :decorator, to: :object

    def object_data
      object.slice('name', 'level', 'race', 'classes')
    end

    def decorated_data
      decorator.decorate
    end

    def provider
      ::User::Character::DND5
    end

    def user_character_id
      object.user_character.id
    end
  end
end
