# frozen_string_literal: true

class CharacterSerializer < ApplicationSerializer
  ATTRIBUTES = %i[id name index_data show_data rule_id].freeze

  attributes :id, :name, :index_data, :show_data, :rule_id

  def index_data
    {
      race: object.data['race'],
      classes: object.data['classes']
    }
  end

  def show_data
    decorator.decorate
  end

  private

  def decorator
    case object.rule.name
    when 'D&D 5'
      character_decorator = Dnd5::CharacterDecorator.new(character: object)
      race_decorator = Dnd5::RaceDecorator.new(decorator: character_decorator)
      Dnd5::ClassDecorator.new(decorator: race_decorator)
    end
  end
end
