# frozen_string_literal: true

class DualityRoll
  include Deps[roll: 'roll']

  def call
    hope = roll.call(dice: 'd12')
    fear = roll.call(dice: 'd12')

    {
      total: hope + fear,
      hope: hope,
      fear: fear
    }
  end
end
