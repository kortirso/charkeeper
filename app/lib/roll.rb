# frozen_string_literal: true

class Roll
  # value - 1d10
  def call(dice:, modifier: 0)
    multiplier, dice_value = dice.split('d')

    result = modifier
    multiplier.to_i.times { result += rand(1..dice_value.to_i) }
    result
  end
end
