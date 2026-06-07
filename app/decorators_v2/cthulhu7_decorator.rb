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

  def calculate_secondary_abilities # rubocop: disable Metrics/AbcSize
    @result['skills'] = generate_skills_payload
    @result['health_max'] = (abilities['con'] + abilities['siz']) / 10
    @result['magic_max'] = abilities['pow'] / 5
    @result['sanity_max'] = abilities['pow']
    @result['damage_bonus'] = find_damage_bonus
    @result['build'] = find_build
    @result['speed'] = 8
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

  def find_damage_bonus
    value = abilities['str'] + abilities['siz']
    return -2 if value <= 64
    return -1 if value <= 84
    return 0 if value <= 124
    return '1d4' if value <= 164

    '1d6'
  end

  def find_build
    value = abilities['str'] + abilities['siz']
    return -2 if value <= 64
    return -1 if value <= 84
    return 0 if value <= 124
    return 1 if value <= 164

    2
  end
end
