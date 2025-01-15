# frozen_string_literal: true

class CharacterSerializer < ApplicationSerializer
  ATTRIBUTES = %i[id name data represented_data rule_id].freeze

  attributes :id, :name, :data, :represented_data, :rule_id

  def represented_data
    presenter.represent_data
  end

  private

  def presenter
    presenter_class.new(character: object)
  end

  def presenter_class
    case object.rule.name
    when 'D&D 5' then ::CharactersContext::Dnd5RulePresenter
    end
  end
end
