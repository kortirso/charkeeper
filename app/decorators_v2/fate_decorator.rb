# frozen_string_literal: true

class FateDecorator < ApplicationDecoratorV2
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
    @result['skills'] = generate_skills_payload
    @result['approaches'] = generate_approaches_payload
    @result['max_stress'] = find_max_stress
    @result['refresh_points'] = find_refresh_points
  end

  def generate_skills_payload
    Config.data('fate', 'skills')
      .merge(additional_skills)
      .map { |slug, values| skill_payload(slug, values) }
  end

  def skill_payload(slug, values)
    {
      slug: slug,
      name: values['name'].is_a?(Hash) ? translate(values['name']) : values['name'],
      level: selected_skills[slug].to_i
    }
  end

  def generate_approaches_payload
    Config.data('fate', 'approaches')
      .map { |slug, values| approaches_payload(slug, values) }
  end

  def approaches_payload(slug, values)
    {
      slug: slug,
      name: values['name'].is_a?(Hash) ? translate(values['name']) : values['name'],
      level: selected_approaches[slug].to_i
    }
  end

  def find_max_stress
    {
      physical: stress_physical_max,
      mental: stress_mental_max
    }
  end

  def find_refresh_points
    3 - [stunts.count - 3, 0].max
  end

  def stress_physical_max
    case stress_system
    when 'core' then stress_max_core(selected_skills['physique'].to_i)
    when 'condensed' then stress_max_condensed(selected_skills['physique'].to_i)
    end
  end

  def stress_mental_max
    case stress_system
    when 'core' then stress_max_core(selected_skills['will'].to_i)
    when 'condensed' then stress_max_condensed(selected_skills['will'].to_i)
    end
  end

  def stress_max_core(skill_value)
    case skill_value
    when 0 then 2
    when 1, 2 then 3
    else 4
    end
  end

  def stress_max_condensed(skill_value)
    case skill_value
    when 0 then 3
    when 1, 2 then 4
    else 6
    end
  end
end
