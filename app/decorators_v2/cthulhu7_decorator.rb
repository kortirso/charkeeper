# frozen_string_literal: true

class Cthulhu7Decorator < ApplicationDecoratorV2
  def call(character:, simple: false, version: nil)
    @character = character
    @version = version
    @result = character.data.attributes

    generate_basis
    return self if simple

    calculate_secondary_abilities

    self
  end

  private

  def generate_basis
    @result['name'] = @character.name
  end

  def calculate_secondary_abilities
    @result['skills'] = generate_skills_payload
  end

  def generate_skills_payload
    Config.data('cthulhu7', 'skills')
      .merge(additional_skills)
      .map { |slug, values| skill_payload(slug, values) }
  end

  def skill_payload(slug, values)
    {
      slug: slug,
      name: values['name'].is_a?(Hash) ? translate(values['name']) : values['name'],
      level: selected_skills[slug] || values['start'],
      start: values['start'],
      improved: improved_skills.include?(slug),
      hidden: hidden_skills.include?(slug)
    }
  end
end
