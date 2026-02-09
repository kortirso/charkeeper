# frozen_string_literal: true

module FateCharacter
  class BaseDecorator < SimpleDelegator
    delegate :data, to: :__getobj__
    delegate :stress_system, :selected_skills, to: :data

    def method_missing(method, *args) # rubocop: disable Lint/UnusedMethodArgument
      __getobj__.respond_to?(method.to_sym) ? __getobj__.public_send(method) : nil
    end

    def max_stress
      {
        physical: stress_physical_max,
        mental: stress_mental_max
      }
    end

    private

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
end
